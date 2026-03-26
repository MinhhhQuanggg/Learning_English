(async () => {
    try {
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'qminh0733@gmail.com', password: 'Quang123@' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error("Login failed:", loginData.message);
            return;
        }

        const token = loginData.token;
        console.log("Logged in! Role:", loginData.user.role);

        const catRes = await fetch('http://127.0.0.1:5000/api/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const catData = await catRes.json();
        console.log("Categories raw data:", JSON.stringify(catData).substring(0, 100));
        console.log("Categories count:", catData.count || (catData.data && catData.data.length));

        const lessonRes = await fetch('http://127.0.0.1:5000/api/lessons', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const lessonData = await lessonRes.json();
        console.log("Lessons count:", lessonData.count);

        const usersRes = await fetch('http://127.0.0.1:5000/api/auth/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        console.log("Users API message:", usersData.message || "Success");
        console.log("Users count:", usersData.count);

    } catch (e) {
        console.error(e);
    }
})();
