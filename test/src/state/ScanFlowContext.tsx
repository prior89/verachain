
import React, { createContext, useContext, useState, useMemo } from 'react';

type Stage = 'idle' | 'product_scanned' | 'certificate_scanned' | 'done';
type Role = 'seller' | 'buyer' | null;

interface ScanFlow {
  stage: Stage;
  role: Role;
  txId?: string;
  reset: () => void;
  onProductRecognized: (payload: { productId: string }) => void;
  onCertificateRecognized: (payload: { qr: string, role: Role }) => Promise<void>;
}

const Ctx = createContext<ScanFlow>(null as any);

export function ScanFlowProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>('idle');
  const [role, setRole] = useState<Role>(null);
  const [txId, setTxId] = useState<string | undefined>();

  const reset = () => { setStage('idle'); setRole(null); setTxId(undefined); };

  const onProductRecognized = ({ productId }: { productId: string }) => {
    // TODO: backend verification call
    setStage('product_scanned');
  };

  const onCertificateRecognized = async ({ qr, role }: { qr: string, role: Role }) => {
    setRole(role);
    // TODO: call backend/blockchain to burn or mint based on role
    // const result = await handleQrFlow(qr, role as 'seller'|'buyer');
    // setTxId(result.txId);
    setStage('done');
  };

  const value = useMemo(() => ({ stage, role, txId, reset, onProductRecognized, onCertificateRecognized }), [stage, role, txId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useScanFlow = () => useContext(Ctx);
