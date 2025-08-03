"use strict";
const revalidatePath = async (path) => {
    await fetch("https://your-next-app.com/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: path }),
    });
};
