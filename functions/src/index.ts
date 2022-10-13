import {identity} from "firebase-functions/v2";

export const blockauth = identity.beforeUserCreated((event) => {
  const email = event?.data?.email || "";
  if (!email.includes("@google.com")) {
    throw new identity.HttpsError(
        "permission-denied",
        "Only @google.com are allowed to register.");
  }
});

