# Turnstile — My Cloudflare Dashboard Steps

## Create the widget

1. Open the Cloudflare dashboard.
2. Open **Turnstile**.
3. Select **Add widget**.
4. Name it `loewfi-contact`.
5. Add these hostnames:
   - `loew.fi`
   - `www.loew.fi`
6. Choose **Managed** mode.
7. Create the widget.
8. Copy the **Sitekey** and send it to Codex. The Sitekey is public and safe to share.
9. Keep the **Secret key** private. Do not paste it into chat or commit it to GitHub.

## Add the secret to the Worker

Do this after Codex confirms the Worker form code is ready:

1. In Cloudflare, open **Compute → Workers & Pages**.
2. Open the `loewfi` Worker.
3. Open **Settings → Variables and Secrets**.
4. Select **Add**.
5. Choose **Secret** or **Encrypt**.
6. Enter this name exactly:

   `TURNSTILE_SECRET_KEY`

7. Paste the private Turnstile **Secret key** as its value.
8. Save the secret.

That is all I need to do in the dashboard. Codex handles the website code, server-side verification, testing, and deployment configuration.

## Liquid-glass reference

[Yassine Bouane’s liquid-glass live demo and documentation](https://liquid-glass.ybouane.com/)
