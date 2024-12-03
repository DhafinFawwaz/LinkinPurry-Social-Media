self.addEventListener("push", (event) => {
    const data = event.data.json();
    const title = data.title;
    const body = data.body;
    const icon = data.icon;
    const url = data.data.url;
  
    const notificationOptions = {
      body: body,
      tag: "chat",
      icon: icon,
      data: {
        url: url,
      },
    };
  
    self.registration.showNotification(title, notificationOptions);
  });

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for(const client of clientList) {
        if(client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if(clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});