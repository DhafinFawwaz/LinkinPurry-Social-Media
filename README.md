<h1 align="center" style="color: #FFFFFF"><em> Tugas Besar IF3110 - Pengembangan Aplikasi Berbasis Web </em></h1>

<br>
<h1 align="center" style="color: #FFFFFF"> Kelompok 06 </h1>

<div align="center">

| NIM        | Nama           |
| ---------------- | ----------------- |
| 13522064 | Devinzen |
| 13522074 | Muhammad Naufal Aulia |
| 13522084 | Dhafin Fawwaz Ikramullah |

</div>

## 📄 Description
This is a web-based application that can be used as a social media to share career information.

## 🔨 Installation
To install this application, simply clone this repository:
```bash
git clone https://github.com/Labpro-21/if-3310-2024-2-k02-06
```
Navigate to project directory:
```bash
cd ./if-3310-2024-2-k02-06
```
Rename all .env.example files to .env
```bash
cd ./frontend
mv .env.example .env
cd ../backend
mv .env.example.dev .env
cd ../
mv .env.example .env
```

For details:
- `.env.example`: database
- `frontend/.env.example`: frontend
- `backend/.env.example.local`: backend, development version
- `backend/.env.example`: backend, used in Github Action

## 🔨 Running the Server
Make sure you have docker installed on your machine. 
Rename the `.env.example` files to `.env` and modify the necessary information if needed.
Then run the following command:
```bash
docker compose up
```
If you want to seed the database, you can run this command in the backend terminal inside the docker container:
```bash
npx tsx prisma/seed.ts
```

Now, you can access the server at `http://localhost:4000`.

Another tips, if you want the frontend to have hot reload, go to docker-compose.yaml and change from
```
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
```
to
```
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile.dev
```

Don't forget to remove the docker container and image for the frontend and rebuild the frontend container again.


## 📷 API Documentation
API Documentation can be accessed at `http://localhost:4000/doc`. Here's a screenshot.
![API Documentation](screenshots/APIdoc.png)

## ⏳ Load Test

### Github
![Load Test Github](screenshots/load-test-github.png)
Before the Github Action limit is exceeded in the Organization, this project manage to finish the load test for the feeds.

### Local
![Load Test Local](screenshots/load-test-local-profile.png)
![Load Test Local](screenshots/load-test-local-feed.png)
The load test is done locally using k6. You can try it your self by following these steps:
1. Install k6

```bash
winget install k6 --source winget
```

2. Run the backend server. Please be aware that if you have tried the development server and redis is used, you may need to clear the redis by deleting the `redis-data` folder.

```
docker compose up
```

3. Run the load test

Command Prompt:

```bash
cd tests
set SERVER_ENDPOINT="http://localhost:3000"; npm run test:profile
set SERVER_ENDPOINT="http://localhost:3000"; npm run test:feed
```

Powershell:

```bash
cd tests
$env:SERVER_ENDPOINT="http://localhost:3000"; npm run test:profile
$env:SERVER_ENDPOINT="http://localhost:3000"; npm run test:feed
```

### Docker
![Load Test Docker](screenshots/load-test-docker-profile.png)
![Load Test Docker](screenshots/load-test-docker-feed.png)
The load test is done in a docker container using k6. You can try it your self by following these steps:

1. Pull and run the database

```bash
docker run -p 5432:5432 -d nicholasliem/wbd-m2-db-image:latest
```

2. Modify the .env file to be the following (use the host.docker.internal, comment the other DATABASE_URL)
```bash
# DATABASE_URL=postgresql://user:supersecretpassword@db/job?schema=public
# DATABASE_URL=postgresql://user:supersecretpassword@localhost:5432/job?schema=public
DATABASE_URL=postgresql://dbuser:dbpassword@host.docker.internal:5432/maindb?schema=public
```

3. Run the backend server. Please be aware that if you have tried the development server and redis is used, you may need to clear the redis by deleting the `redis-data` folder.
```bash
docker-compose -f docker-compose.test.yml up
```

4. Build the tests
```bash
docker build -f Dockerfile.tests -t backend-tests .
```

5. Run the tests
```bash
docker run -it backend-tests
```


## 📄 Pembagian Tugas
| Fitur                                              | NIM |
| -------------------------------------------------- | --- |
| Login                                              |     |
| Register                                           |     |
| Profile                                            |     |
| Feed                                               |     |
| Daftar Pengguna                                    |     |
| Permintaan Koneksi                                 |     |
| Daftar Koneksi                                     |     |
| Chat                                               |     |
| Authentication and Authorization                   |     |
| Websocket                                          |     |
| Notifikasi                                         |     |
| Stress and Load test                               |     |
| Responsifitas                                      |     |
| Docker                                             |     |
| Bonus: UI/UX Seperti LinkedIn                      |     |
| Bonus: Caching                                     |     |
| Bonus: Connection Recommendation                   |     |
| Bonus: Typing Indicator                            |     |
| Bonus: Google Lighthouse                           |     |

## ✨ Bonus

### Bonus: UI/UX Seperti LinkedIn
![Linkedin like UI/UX](screenshots/linkedin-like-ui-ux.png)

### Bonus: Caching
![Caching with Redis](screenshots/caching.png)

### Bonus: Connection Recommendation
![Recommendation](screenshots/recommendation.png)

### Bonus: Typing Indicator
![Typing Indicator](screenshots/typing-indicator.png)

### Bonus: Google Lighthouse

