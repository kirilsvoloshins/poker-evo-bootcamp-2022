import store from "../Store";

describe("big title", () => {
  describe("small title", () => {
    it("should do something I guess", () => {

      expect(store.currentPage).toEqual("Game");
    });
  });
});