import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

function maskName(name) {
  if (!name) return "";

  const firstThree = name.slice(0, 3);
  const hidden = "*".repeat(Math.max(name.length - 3, 0));

  return firstThree + hidden;
}

async function sendWhatsApp(message) {
  try {
    const response = await axios.post(
      `https://api.w-api.app/v1/message/send-text?instanceId=${process.env.W_API_INSTANCE}`,
      {
        phone: process.env.MY_NUMBER,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WAPI_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Mensagem enviada:", response.data);
  } catch (error) {
    console.log(
      "Erro ao enviar:",
      error.response?.data || error.message
    );
  }
}

app.post("/webhook/perfectpay", async (req, res) => {
  try {
    const data = req.body;

    if (data?.sale_status_enum_key === "approved") {
      const customer = data.customer.full_name;
      const maskedCustomer = maskName(customer);
      const product = data.product.name;
      const value = data.sale_amount;

      console.log(maskedCustomer);

      const message = `
🔥 NOVA VENDA - Você é TOP  

👤 Cliente: ${maskedCustomer}
📦 Produto: ${product}
💰 Valor: R$ ${value}
      `;

      await sendWhatsApp(message);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "erro interno" });
  }
});

app.listen(process.env.PORT || 3333, () => {
  console.log("Servidor rodando");
});