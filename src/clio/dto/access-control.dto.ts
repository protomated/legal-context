/**
 * Document access event types for audit logging
 */
export enum DocumentAccessEventType {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  REVOKED = 'REVOKED',
}

/**
 * Structure for document access events for audit logging
 */
export interface DocumentAccessEvent {
  documentId: string;
  userId: string;
  eventType: DocumentAccessEventType;
  timestamp: Date;
  reason?: string;
  sourceIp?: string;
  documentInfo?: {
    name?: string;
    contentType?: string;
    matterId?: string;
  };
}

/**
 * Options for configuring access control behavior
 */
export interface AccessControlOptions {
  /**
   * Cache TTL in milliseconds
   */
  cacheTtl?: number;
  
  /**
   * Whether to enforce strict access controls (defaults to true)
   */
  strictMode?: boolean;
  
  /**
   * Whether to log access events (defaults to true)
   */
  enableLogging?: boolean;
}
