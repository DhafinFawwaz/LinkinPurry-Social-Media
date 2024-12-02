import webpush from 'web-push';

const publicKey = process.env.VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
if(!publicKey || !privateKey) {
    console.error("Please provide VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in environment variables");
    process.exit(1);
}

webpush.setVapidDetails(
    "mailto:contact@my-site.com",
    publicKey,
    privateKey
)

export default webpush;

