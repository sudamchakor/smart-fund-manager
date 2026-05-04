import store from "../../../src/store/index";

describe("Redux Store Configuration", () => {
  it("should configure the store with correct reducers and persistence", () => {
    const state = store.getState();
    
    // Validate that all our slices are present
    expect(state).toHaveProperty("emi");
    expect(state).toHaveProperty("tax");
    expect(state).toHaveProperty("profile");
    expect(state._persist).toBeDefined(); // Validates redux-persist initialization
  });
});