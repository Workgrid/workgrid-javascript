import { greeter } from "./greet"

test('basic',async () => {
    expect(greeter("Jason")).toBe("Hello, Jason");
  });