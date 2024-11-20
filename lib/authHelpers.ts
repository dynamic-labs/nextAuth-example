import jwt, { JwtPayload, Secret, VerifyErrors } from "jsonwebtoken";

export const getKey = (
  headers: any,
  callback: (err: Error | null, key?: Secret) => void
): void => {
  // Define the options for the fetch request
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_DYNAMIC_BEARER_TOKEN}`,
    },
  };

  // Perform the fetch request asynchronously
  fetch(
    `https://app.dynamicauth.com/api/v0/environments/${process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/keys`,
    options
  )
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const publicKey = json.key.publicKey;

      const pemPublicKey = Buffer.from(publicKey, "base64").toString("ascii");
      
      callback(null, pemPublicKey);
    })
    .catch((err) => {
      console.error("Error fetching public key:", err);
      callback(err);
    });
};

export const validateJWT = async (
  token: string
): Promise<JwtPayload | null> => {
  try {
    const decodedToken = await new Promise<JwtPayload | null>(
      (resolve, reject) => {
        jwt.verify(
          token.trim(),
          getKey,
          { algorithms: ["RS256"] },
          (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
            if (err) {
              console.log("JWT verification error:", err);
              reject(err);
            } else {
              console.log("JWT successfully decoded");
              if (typeof decoded === "object" && decoded !== null) {
                resolve(decoded);
              } else {
                reject(new Error("Invalid token"));
              }
            }
          }
        );
      }
    );
    return decodedToken;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
