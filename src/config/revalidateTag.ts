import config from "./config";

export const revalidateTag = async (tag: string) => {
  const environment = config.NODE_ENV;
  let url;
  if (environment === "development") {
    url = "http://localhost:3000/";
  } else if (environment === "production") {
    url = config.PRODUCTION_URL;
  }

  await fetch(`${url}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag: tag }),
  });
};
