const testAuth = async () => {
    console.log('--- TEST REGISTER ---');
    let res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: 'New User',
            email: 'newuser@example.com',
            password: 'newpassword',
            passwordConfirm: 'newpassword',
            phone: '0987654321',
            level: 'Thấp'
        })
    });
    let data = await res.json();
    console.log('Registration Data:', data);

    // We cannot easily test verify without extracting the code from DB or server logs in this script,
    // but we can try login with unverified email to see if it blocks and then manual review is enough.
    console.log('\n--- TEST LOGIN UNVERIFIED ---');
    res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'newpassword'
        })
    });
    data = await res.json();
    console.log('Login Unverified Data:', data);
};

testAuth();
