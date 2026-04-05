import Account from "../models/account.model";

/**
 * Controller for account-related operations
 * Handles account creation, fetching user accounts, and fetching account details by ID
 * Utilizes the Account model and authentication middleware to ensure secure access
 * Each function is designed to handle specific API endpoints related to accounts
 * Error handling is implemented to provide meaningful responses in case of failures
 * The getAccountDetailsById function also calculates the current balance using the getBalance method from the Account model
 */
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

/**
 * Get all accounts for the authenticated user
 * Utilizes the user ID from the authentication middleware to fetch accounts specific to the user
 * Returns a list of accounts associated with the user
 */
export const getUserAccounts = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const accounts = await Account.find({ user: userId });
    
    // Attach dynamically calculated balance to each account
    const accountsWithBalances = await Promise.all(
      accounts.map(async (acc) => {
        const balance = await acc.getBalance();
        return { ...acc.toObject(), balance };
      })
    );

    res.status(200).json({ accounts: accountsWithBalances });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Server error while fetching accounts" });
  }
};
/**
 * Get account details by account ID
 * Validates that the account belongs to the authenticated user before fetching details
 * Utilizes the getBalance method from the Account model to calculate the current balance
 * Returns account details along with the current balance
 */
export const getAccountDetailsById = async (req: any, res: any) => {
  try {
    const rawAccId = req.params.accountId || "";
    const accId = rawAccId.replace(/^:/, ''); 
    const account = await Account.findById(accId);
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

