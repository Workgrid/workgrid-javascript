import { greeter } from "../src/greet"

test('basic',async () => {
    expect(greeter("Jason")).toBe("Hello, Jason");
  });