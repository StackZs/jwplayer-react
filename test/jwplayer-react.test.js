/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import JWPlayer from "../src/jwplayer";
import { mockLibrary, players } from "./util";

const noop = () => {};

const playlist = "https://cdn.jwplayer.com/v2/media/1g8jjku3";
const library = "https://cdn.jwplayer.com/libraries/lqsWlr4Z.js";
let expectedInstance = -1;

beforeEach(() => {
  window.jwplayer = mockLibrary;
  document.body.innerHTML = "";
});

afterEach(() => {
  window.jwplayer = null;
  jest.restoreAllMocks();
});

describe("setup", () => {
  const setupTest = (props) => {
    const { container } = render(<JWPlayer {...props} />);
    expectedInstance++;
    return container;
  };

  const checkTests = (componentInstance) => {
    const instance = componentInstance.querySelector(
      `#jwplayer-${expectedInstance}`
    );
    expect(instance).toBeInTheDocument(); // Проверяем, что элемент с ID существует
    expect(players[`jwplayer-${expectedInstance}`]).toBeDefined(); // Проверяем, что player создан
    expect(
      window.jwplayer(`jwplayer-${expectedInstance}`).setup
    ).toHaveBeenCalledWith({
      playlist: "https://cdn.jwplayer.com/v2/media/1g8jjku3",
      isReactComponent: true,
    });
  };

  it("sets up when jwplayer is pre-instantiated", async () => {
    const container = setupTest({ playlist });
    checkTests(container);
  });

  it("sets up when jwplayer library provided", async () => {
    const container = setupTest({ playlist, library });
    checkTests(container);
  });

  it("Errors with no library and falsey window.jwplayer", async () => {
    window.jwplayer = null;
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<JWPlayer playlist={playlist} />)).toThrow(
      "jwplayer-react requires either a library prop, or a library script"
    );
    consoleErrorSpy.mockRestore();
  });

  it("creates a script tag when mounted if window.jwplayer is not defined", async () => {
    window.jwplayer = null;
    setupTest({ library, playlist });
    await waitFor(() => {
      const script = document.getElementsByTagName("script")[0];
      expect(script).toBeInstanceOf(HTMLScriptElement);
      expect(script.src).toBe(library);
    });
  });
});

describe("methods", () => {
  const createMountedComponent = (props) =>
    render(<JWPlayer library={library} playlist={playlist} {...props} />);

  describe("generateId", () => {
    it("increments index when generating unique ID", async () => {
      const { container: component1 } = createMountedComponent();
      expectedInstance++;
      expect(
        component1.querySelector(`#jwplayer-${expectedInstance}`)
      ).toBeInTheDocument();

      const { container: component2 } = createMountedComponent();
      expect(
        component2.querySelector(`#jwplayer-${++expectedInstance}`)
      ).toBeInTheDocument();

      const { container: component3 } = createMountedComponent();
      expect(
        component3.querySelector(`#jwplayer-${++expectedInstance}`)
      ).toBeInTheDocument();
    });
  });

  describe("generateConfig", () => {
    it("generates a setup config from props without assigning unsupported properties", async () => {
      const { container } = createMountedComponent({
        unsupportedProperty: 3,
        floating: {},
        width: 500,
      });
      const id = `jwplayer-${expectedInstance}`;
      const setupConfig = window.jwplayer(id).setup.mock.calls[0][0];
      expect(setupConfig).toEqual({
        floating: {},
        isReactComponent: true,
        playlist: "https://cdn.jwplayer.com/v2/media/1g8jjku3",
        width: 500,
      });
    });

    it("Props overwrite matching base config properties", async () => {
      const baseConfig = { width: 400, height: 300 };
      const { container } = createMountedComponent({
        config: baseConfig,
        unsupportedProperty: 3,
        floating: {},
        width: 500,
      });
      const id = `jwplayer-${expectedInstance}`;
      const setupConfig = window.jwplayer(id).setup.mock.calls[0][0];
      expect(setupConfig).toEqual({
        floating: {},
        isReactComponent: true,
        playlist: "https://cdn.jwplayer.com/v2/media/1g8jjku3",
        width: 500,
        height: 300,
      });
    });

    it("Base config overwrites jwDefaults", async () => {
      const baseConfig = { width: 720, height: 480 };
      window.jwDefaults = { width: 400, height: 300, floating: {} };
      const { container } = createMountedComponent({ config: baseConfig });
      const id = `jwplayer-${expectedInstance}`;
      const setupConfig = window.jwplayer(id).setup.mock.calls[0][0];
      window.jwDefaults = {};
      expect(setupConfig).toEqual({
        width: 720,
        height: 480,
        floating: {},
        isReactComponent: true,
        playlist: "https://cdn.jwplayer.com/v2/media/1g8jjku3",
      });
    });
  });

  it("createEventListeners", async () => {
    const { container } = createMountedComponent({
      onReady: noop,
      onPlay: noop,
      oncePause: noop,
    });
    const id = `jwplayer-${expectedInstance}`;
    expect(window.jwplayer(id).once).toHaveBeenCalledTimes(1);
    expect(window.jwplayer(id).on).toHaveBeenCalledTimes(1);
    expect(window.jwplayer(id).on).toHaveBeenCalledWith(
      "all",
      expect.any(Function)
    );
  });

  /// ...
});
