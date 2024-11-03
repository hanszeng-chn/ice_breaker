export async function scrapeLinkedInProfile(
  profileUrl: string,
  mock: boolean = true
) {
  let data: any = {};
  if (mock) {
    const resp = await fetch(
      "https://gist.githubusercontent.com/emarco177/0d6a3f93dd06634d95e46a2782ed7490/raw/fad4d7a87e3e934ad52ba2a968bad9eb45128665/eden-marco.json"
    );
    data = await resp.json();
  } else {
    // todo: proxy curl
  }

  const keys = Object.keys(data);
  for (const key of keys) {
    const value = data[key];
    if (
      value === "" ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete data[key];
    }
  }

  return data;
}
