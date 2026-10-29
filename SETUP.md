# Setup guide (one time, about 15 minutes)

## 1. Put the project on GitHub
1. Create a free account at github.com (use the client's email if the client will own the site).
2. Click New repository, name it (e.g. client-blog), keep the default branch as `main`.
3. Upload every file and folder from this project (do NOT upload node_modules or dist).

## 2. Deploy on Netlify
1. Sign up at netlify.com with the same GitHub account.
2. Add new site > Import an existing project > GitHub > pick the repository.
3. Netlify reads netlify.toml automatically. Click Deploy.
4. Your site is live at yourname.netlify.app.

## 3. Turn on the login for the admin page
1. In Netlify open the site > Site configuration > Identity (or Integrations > Identity) and enable it.
2. Set registration to "Invite only".
3. Under Identity > Services > Git Gateway, click Enable Git Gateway.
4. Under Identity, click Invite users and send an invite to the client's email.
5. The client clicks the link in the email, sets a password, and is taken to /admin.

If Identity or Git Gateway is not available on your Netlify account, tell Claude. The fix is a small change to admin/config.yml to use a GitHub login instead.

## 4. Adding a post (what the client does)
1. Go to yourwebsite.com/admin and log in.
2. Click New Post, fill in the title, date, category, emoji, summary, optional cover image and the text.
3. Click Publish. The site rebuilds and the post appears in about 1 to 2 minutes with its own page.

## 5. Before applying for AdSense
- Replace the 6 sample posts with real, original articles (about 15 to 30).
- Rewrite the About, Contact and Privacy Policy sections in index.html (template.html).
- Connect a custom domain in Netlify > Domain management.
- Until ads are switched on, visitors see no ad boxes at all.

## 6. Turning ads on (after AdSense approves the site)
1. Go to /admin > Settings > Ad settings.
2. Paste the AdSense publisher ID (ca-pub-...) and the slot ID of each ad unit you created. Leave a slot empty to skip that position.
3. Switch "Show ads" on and Publish. The site rebuilds in 1 to 2 minutes and the ads.txt file is created automatically.
4. To pause ads, switch "Show ads" off and Publish.
5. If you prefer Google's Auto ads, enter only the publisher ID, switch ads on, and turn on Auto ads in the AdSense dashboard.
