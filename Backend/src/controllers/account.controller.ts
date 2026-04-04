import Account from "../models/account.model";


export const createAccount = async (req: any, res: any) => {
  try {
    const userId = req.user._id; 
    const newAccount = new Account({
      user: userId,
      status: "active",
      currency: "INR",
    });

    await newAccount.save();
    res.status(201).json({ message: "Account created successfully", account: newAccount });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ message: "Server error while creating account" });
  }
};


export const getUserAccounts = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const accounts = await Account.find({ user: userId });
    res.status(200).json({ accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Server error while fetching accounts" });
  }
};

export const getAccountDetailsById = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const accountId = req.params.accountId;

    const account = await Account.findOne({ _id: accountId, user: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const balance = await account.getBalance();
    res.status(200).json({ account, balance });
  } catch (error) {
    console.error("Error fetching account details:", error);
    res.status(500).json({ message: "Server error while fetching account details" });
  }
};