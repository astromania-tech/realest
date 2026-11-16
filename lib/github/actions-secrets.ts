import sodium from "libsodium-wrappers";

type GitHubActionsSecretInput = {
  owner: string;
  repository: string;
  name: string;
  value: string;
  token: string;
  fetcher?: typeof fetch;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function updateGitHubActionsSecret({
  owner,
  repository,
  name,
  value,
  token,
  fetcher = fetch,
}: GitHubActionsSecretInput): Promise<void> {
  if (!/^[A-Za-z0-9-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GitHub repository owner or name is invalid.");
  }
  if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) {
    throw new Error("GitHub Actions secret name is invalid.");
  }

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions/secrets`;
  const headers = {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
    "x-github-api-version": "2022-11-28",
  };
  const keyResponse = await fetcher(`${apiUrl}/public-key`, { headers });
  const keyData: unknown = await keyResponse.json();
  if (!keyResponse.ok || !isRecord(keyData)) {
    throw new Error(`Could not get the GitHub Actions secret public key (HTTP ${keyResponse.status}).`);
  }
  if (typeof keyData.key !== "string" || typeof keyData.key_id !== "string") {
    throw new Error("GitHub Actions secret public key response is invalid.");
  }

  await sodium.ready;
  const encryptedValue = sodium.crypto_box_seal(
    sodium.from_string(value),
    sodium.from_base64(keyData.key, sodium.base64_variants.ORIGINAL),
  );
  const response = await fetcher(`${apiUrl}/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      encrypted_value: sodium.to_base64(encryptedValue, sodium.base64_variants.ORIGINAL),
      key_id: keyData.key_id,
    }),
  });
  if (!response.ok) {
    throw new Error(`Could not update GitHub Actions secret ${name} (HTTP ${response.status}).`);
  }
}
