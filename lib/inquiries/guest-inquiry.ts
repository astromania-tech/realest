export function guestInquiryHttpResult(input: { saved: boolean; notified: boolean }): {
  status: number;
  body: { saved?: boolean; notified?: boolean; message?: string; error?: string };
} {
  if (!input.saved) {
    return { status: 500, body: { error: "The inquiry was not saved." } };
  }
  if (input.notified) {
    return {
      status: 201,
      body: {
        saved: true,
        notified: true,
        message: "Inquiry received. The owner has been notified.",
      },
    };
  }
  return {
    status: 201,
    body: {
      saved: true,
      notified: false,
      message: "Inquiry received. The notification could not be sent.",
    },
  };
}
