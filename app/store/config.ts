import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

export const DEFAULT_CONFIG = {
  submitKey: SubmitKey.Enter as SubmitKey,
  // avatar: "1f9f8",
  avatar: "1f37b",
  fontSize: 14,
  theme: Theme.Dark as Theme,
  tightBorder: false,
  sendPreviewBubble: false,
  sidebarWidth: 300,

  disablePromptHint: false,

  dontShowMaskSplashScreen: false, // dont show splash screen when create chat

  modelConfig: {
    model: "gpt-4o-mini" as ModelType,
    temperature: 0.5,
    max_tokens: 2000,
    presence_penalty: 0,
    sendMemory: true,
    historyMessageCount: 4,
    compressMessageLengthThreshold: 1000,
  },
};

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ChatConfigStore = ChatConfig & {
  reset: () => void;
  update: (updater: (config: ChatConfig) => void) => void;
};

export type ModelConfig = ChatConfig["modelConfig"];

const ENABLE_GPT4 = true;

export const ALL_MODELS = [
  {
    name: "gpt-4",
    // available: ENABLE_GPT4,
    available: false,
  },
  {
    name: "gpt-4-32k",
    // available: ENABLE_GPT4,
    available: false,
  },
  {
    name: "gpt-4o",
    // available: ENABLE_GPT4,
    available: false,
  },
  {
    name: "gpt-4o-mini",
    available: ENABLE_GPT4,
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k",
    available: true,
  },
  {
    name: "deepseek-chat", // deepseek-chat
    available: true,
  },
  {
    name: "deepseek-reasoner", // deepseek-reasoner
    available: true,
  },
  // {
  //   name: "qwen-v1", // 通义千问
  //   available: false,
  // },
  // {
  //   name: "ernie", // 文心一言
  //   available: false,
  // },
  // {
  //   name: "spark", // 讯飞星火
  //   available: false,
  // },
  // {
  //   name: "llama", // llama
  //   available: false,
  // },
  // {
  //   name: "chatglm", // chatglm-6b
  //   available: false,
  // },
] as const;

export type ModelType = (typeof ALL_MODELS)[number]["name"];

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (typeof x !== "number" || isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export function limitModel(name: string) {
  return ALL_MODELS.some((m) => m.name === name && m.available)
    ? name
    : ALL_MODELS[3].name;
}

export const ModalConfigValidator = {
  model(x: string) {
    return limitModel(x) as ModelType;
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 32000, 2000);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
};

export const useAppConfig = create<ChatConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,

      reset() {
        set(() => ({ ...DEFAULT_CONFIG }));
      },

      update(updater) {
        const config = { ...get() };
        updater(config);
        set(() => config);
      },
    }),
    {
      name: StoreKey.Config,
      version: 2,
      migrate(persistedState, version) {
        if (version === 2) return persistedState as any;

        const state = persistedState as ChatConfig;
        state.modelConfig.sendMemory = true;
        state.modelConfig.historyMessageCount = 4;
        state.modelConfig.compressMessageLengthThreshold = 1000;
        state.dontShowMaskSplashScreen = false;

        return state;
      },
    },
  ),
);
