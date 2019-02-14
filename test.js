function getSomething() {
    let info;
    setTimeout(() => info = 'something', 5000);
    console.log(info);
    return info;
}

async function testAsync() {
    return Promise.resolve("hello async");
}

async function test3() {
    return new Promise(resolve => {
        setTimeout(() => resolve("long_time_value"), 1000);
    });
}

async function test() {
    const v1 = await getSomething();
    const v2 = await testAsync();
    const v3 = test3();
    console.log(v1, v2, v3);
}

test();