function getApiUrl() {
    if(!window.location.port) return import.meta.env.VITE_API_URL;
    const hostName = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostName}:3000`
}

export default function toImageSrc(img: string) {
    // return getApiUrl() +"/uploads/img/"+ img;
    return getApiUrl() + img;
    // return getApiUrl() + "/" + img;
}