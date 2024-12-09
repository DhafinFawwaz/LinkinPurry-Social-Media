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
mv .env.example .env
cd ../
mv .env.example .env
```

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

## 📷 API Documentation
<img src="screenshots/APIdoc.png"/>

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
