/**
 * HubSpot, Meta Pixel, and Zendesk — marketing / waitlist surfaces only.
 * Do not mount from the root layout (dashboard, auth, and marketplace pay
 * the cost of these scripts otherwise).
 */
export function MarketingTrackingScripts() {
  return (
    <>
      {/* HubSpot Tracking Code */}
      <script
        type="text/javascript"
        id="hs-script-loader"
        async
        defer
        src="//js-eu1.hs-scripts.com/147628032.js"
      />

      {/* Meta Pixel Code */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '930986666494169');
              fbq('track', 'PageView');
            `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=930986666494169&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>

      {/* Zendesk Widget */}
      <script
        id="ze-snippet"
        src="https://static.zdassets.com/ekr/snippet.js?key=16241a82-2e89-4760-a55a-eebed2ba144a"
      />
    </>
  );
}
