import { z } from 'zod';

/**
 * 應用程式配置 Schema 範例
 * 用於驗證計畫中的 API 回傳或本地存儲數據
 */
export const AppConfigSchema = z.object({
  apiEndpoint: z.string().optional(),
  defaultTimezone: z.string().default('Asia/Taipei'),
  features: z.object({
    enableHistory: z.boolean().default(true),
    enableCloudSync: z.boolean().default(false)
  })
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
