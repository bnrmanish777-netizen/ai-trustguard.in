import { runDemoCustomerSupportAI, runDemoCodingAssistant, runDemoFinanceAssistant } from './demoTargets.js';
import { env } from '../config/env.js';
import axios from 'axios';
import { logger } from '../utils/logger.js';

export const getTargetAIProvider = (aiSystem) => {
  // If system is one of our demo AIs or provider is 'demo'
  if (aiSystem.name?.includes('Customer Support') || aiSystem.system_type === 'customer_support') {
    return {
      name: 'DemoCustomerSupportProvider',
      invoke: async (prompt) => runDemoCustomerSupportAI(prompt),
    };
  }

  if (aiSystem.name?.includes('Coding Assistant') || aiSystem.system_type === 'code_assistant') {
    return {
      name: 'DemoCodingAssistantProvider',
      invoke: async (prompt) => runDemoCodingAssistant(prompt),
    };
  }

  if (aiSystem.name?.includes('Finance Assistant') || aiSystem.system_type === 'financial_advisory') {
    return {
      name: 'DemoFinanceAssistantProvider',
      invoke: async (prompt) => runDemoFinanceAssistant(prompt),
    };
  }

  // Live Custom API endpoint or external LLM
  if (aiSystem.endpoint_url && !aiSystem.endpoint_url.includes('example.com')) {
    return {
      name: 'CustomHttpProvider',
      invoke: async (prompt) => {
        const start = Date.now();
        try {
          const res = await axios.post(
            aiSystem.endpoint_url,
            { prompt, message: prompt },
            {
              headers: {
                'Content-Type': 'application/json',
                ...(aiSystem.api_key_encrypted ? { Authorization: `Bearer ${aiSystem.api_key_encrypted}` } : {}),
              },
              timeout: 10000,
            }
          );
          const latencyMs = Date.now() - start;
          const text = res.data?.response || res.data?.text || res.data?.message || JSON.stringify(res.data);
          return { text, latencyMs };
        } catch (err) {
          logger.warn('Failed to call custom target endpoint, falling back to controlled response', { error: err.message });
          return { text: `Target error: ${err.message}`, latencyMs: Date.now() - start };
        }
      },
    };
  }

  // Default fallback to Demo Customer Support
  return {
    name: 'DefaultDemoProvider',
    invoke: async (prompt) => runDemoCustomerSupportAI(prompt),
  };
};
