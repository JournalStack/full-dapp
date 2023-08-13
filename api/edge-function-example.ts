export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const cookies = request.headers.get("cookie");
  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = null;
  }

  // Hash the data
  const hashedData = getSHA256Hash(githubData);
  console.log("hashedData", hashedData);

  try {
    const schemaEncoder = new SchemaEncoder("string dataHash");
    console.log("schemaEncoder", schemaEncoder);

    const encoded = schemaEncoder.encodeData([
      { name: "dataHash", type: "string", value: hashedData },
    ]);

    const signer = await getDelegationSigner(res);
    if (!signer) {
      return;
    }
    console.log("signer", signer);

    eas.connect(signer);

    const recipient = userAddress;
    console.log("recipient", recipient);

    const tx = await eas.attest({
      data: {
        recipient: recipient,
        data: encoded,
        refUID: ethers.constants.HashZero,
        revocable: true,
        expirationTime: 0,
      },
      schema: CUSTOM_SCHEMAS.GITHUB_SCHEMA,
    });
    console.log("tx", tx);

    const uid = await tx.wait();
    console.log("uid", uid);

    const attestation = await getAttestation(uid);
    console.log("attestation", attestation);

    return new Response(
      JSON.stringify({
        body,
        query,
        cookies,
        data: { recipient: recipient, uid: "uid" },
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("errorDebug", error);
    return new Response(
      JSON.stringify({
        body,
        query,
        cookies,
        data: "certificate creation failed",
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }
}
