# Word Challenge | تحدي المفردات

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=flat-square&logo=socket.io&badgeColor=010101)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**Realtime multiplayer Arabic word game built with Next.js, Node.js, and Socket.IO.**

لعبة كلمات عربية جماعية تعمل بالزمن الحقيقي، تعتمد على سرعة التفكير، التحدي، والاعتراض بين اللاعبين.

---

## 🎮 About the Game | فكرة اللعبة

A fast-paced word game that tests your vocabulary and speed!

* **Multiplayer:** Play with 2–4 players.
* **The Start:** The game begins with a random 3-letter word.
* **The Rules:** In each turn, you must change **only one letter** to form a new, valid Arabic word.
* **Timer:** Limited time for every turn ⏱️.
* **VAR System:** Players can challenge/object to doubtful words.
* **Winning:** The first player to get rid of all their cards wins 🏆.

---

## 🛠 Tech Stack | التقنيات المستخدمة

This project relies on a modern, robust stack for real-time performance.

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Realtime** | Socket.IO |

---

## 🌐 Environment Variables | المتغيرات البيئية

You need to configure the frontend to connect to the backend. Create a `.env.local` file inside `client/web`:

**File:** `client/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🤝 Contributing | المساهمة

Contributions are welcome! 🙌
Please check the **Issues** tab for refactor tasks, bug fixes, or feature improvements.

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes
```Bash
git commit -m 'Add some AmazingFeature'
```
4. **Push to the Branch
```Bash
git push origin feature/AmazingFeature
```
5. **Open a Pull Request
---
**📜 License
Distributed under the MIT License.
