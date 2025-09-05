import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes duplicate responses based on multiple criteria
 * @param responses Array of response objects
 * @returns Deduplicated array of responses
 */
export function deduplicateResponses(responses: any[]): any[] {
  const seenResponses = new Map<string, any>();
  const deduplicatedData: any[] = [];

  responses.forEach(response => {
    // Create a unique key based on multiple fields to identify duplicates
    const duplicateKey = [
      response.lead_id,
      response.campaign_id,
      response.response_label,
      response.response_text?.trim(),
      response.received_date_iso_clay
    ].join('|');

    // If we haven't seen this combination before, add it
    if (!seenResponses.has(duplicateKey)) {
      seenResponses.set(duplicateKey, response);
      deduplicatedData.push(response);
    } else {
      // If we have seen this combination, keep the one with the most recent received_at
      const existingResponse = seenResponses.get(duplicateKey);
      const currentReceivedAt = new Date(response.received_at || response.created_at || 0);
      const existingReceivedAt = new Date(existingResponse.received_at || existingResponse.created_at || 0);
      
      if (currentReceivedAt > existingReceivedAt) {
        // Replace with the more recent response
        const index = deduplicatedData.findIndex(r => r.id === existingResponse.id);
        if (index !== -1) {
          deduplicatedData[index] = response;
          seenResponses.set(duplicateKey, response);
        }
      }
    }
  });

  return deduplicatedData;
}