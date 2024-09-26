import { useEffect, useState } from "react";

export const meta = () => {
  return [
    { title: "Bitcoin Wallet" },
    { name: "description", content: "A basic Bitcoin wallet in Remix." },
  ];
};

// Helper Functions
const getBitcoinAccounts = async (): Promise<string[] | false> => {
  if (!window.keepkey?.bitcoin) return false;
  try {
    const accounts = await window.keepkey.bitcoin.request({
      method: "request_accounts",
    });
    return accounts.length > 0 ? accounts : false;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return false;
  }
};

const getBitcoinBalance = async (): Promise<string | false> => {
  if (!window.keepkey?.bitcoin) return false;
  try {
    const balance = await window.keepkey.bitcoin.request({
      method: "request_balance",
    });
    return balance.length > 0 ? balance[0].balance : false;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return false;
  }
};

const sendBitcoin = async (
    from: string,
    to: string,
    amount: string
): Promise<boolean> => {
  if (!window.keepkey?.bitcoin) return false;
  try {
    const txParams = {
      amount: {
        amount,
        decimals: 8,
      },
      asset: {
        chain: "bitcoin",
        symbol: "BTC",
        ticker: "BTC",
      },
      from,
      memo: "",
      recipient: to,
    };
    const signedTx = await window.keepkey.bitcoin.request({
      method: "transfer",
      params: [txParams],
    });
    return signedTx ? true : false;
  } catch (error) {
    console.error("Error sending Bitcoin:", error);
    return false;
  }
};

export default function BitcoinWallet() {
  const [balance, setBalance] = useState<string>("Loading...");
  const [address, setAddress] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<string>("");

  useEffect(() => {
    const fetchBalanceAndAddress = async () => {
      const addr = await getBitcoinAccounts();
      if (addr) {
        setAddress(addr[0]);
      } else {
        setAddress("No account found.");
      }

      const bal = await getBitcoinBalance();
      if (bal) {
        setBalance(parseFloat(bal).toFixed(8) + " BTC");
      } else {
        setBalance("Unable to fetch balance.");
      }
    };

    fetchBalanceAndAddress();
  }, []);

  const handleSend = async () => {
    const recipient = prompt("Enter recipient Bitcoin address:");
    const amount = prompt("Enter amount to send (BTC):");

    if (!recipient || !amount) {
      alert("Recipient address and amount are required.");
      return;
    }

    setIsSending(true);
    const success = await sendBitcoin(address, recipient, amount);
    setIsSending(false);

    if (success) {
      setSendStatus("Transaction sent successfully!");
      const bal = await getBitcoinBalance();
      if (bal) {
        setBalance(parseFloat(bal).toFixed(8) + " BTC");
      }
    } else {
      setSendStatus("Failed to send transaction.");
    }
  };

  const handleReceive = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Bitcoin address copied to clipboard!");
    }
  };

  return (
      <div style={styles.container}>
        <img
            src="https://pioneers.dev/coins/bitcoin.png"
            alt="Bitcoin Logo"
            style={styles.logo}
        />
        <h2 style={styles.title}>Bitcoin Wallet</h2>
        <p style={styles.balance}>Balance: {balance}</p>
        <div style={styles.buttons}>
          <button onClick={handleSend} disabled={isSending} style={styles.button}>
            {isSending ? "Sending..." : "Send"}
          </button>
          <button onClick={handleReceive} style={styles.button}>
            Receive
          </button>
        </div>
        {sendStatus && <p style={styles.status}>{sendStatus}</p>}
        {address && (
            <div style={styles.addressContainer}>
              <p>Your Address:</p>
              <p style={styles.address}>{address}</p>
            </div>
        )}
      </div>
  );
}

// Inline Styles
const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    textAlign: "center" as "center",
    color: "#333", // Ensures the text is dark and readable
  },
  logo: {
    width: "80px",
    height: "80px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold" as "bold",
    marginBottom: "20px",
    color: "#333", // Dark text color for the title
  },
  balance: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#333", // Dark text color for the balance
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  button: {
    flex: "1",
    padding: "10px 20px",
    margin: "0 5px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  status: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#FF0000", // Red color for error/status messages
  },
  addressContainer: {
    marginTop: "20px",
    textAlign: "left" as "left",
  },
  address: {
    wordWrap: "break-word" as "break-word",
    fontSize: "14px",
    color: "#333", // Dark text color for the address
  },
};

