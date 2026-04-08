export function getWhatsappStatusLabel(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'connected') {
    return 'Connected';
  }

  if (normalized === 'disconnected') {
    return 'Disconnected';
  }

  if (normalized === 'qr_required') {
    return 'QR Required';
  }

  if (normalized === 'not_configured') {
    return 'Not Configured';
  }

  if (normalized === 'pending') {
    return 'Pending';
  }

  return normalized ? normalized.replace(/_/g, ' ') : 'Unknown';
}

export function getWhatsappBindingMeta(bindingMode) {
  const normalized = String(bindingMode || '').trim().toLowerCase();

  if (normalized === 'global_meta_default') {
    return {
      label: 'Shared Default Line',
      tone: 'shared',
      description: 'This restaurant is using the platform-wide Meta test line.',
    };
  }

  if (normalized === 'configured_pending_session') {
    return {
      label: 'Dedicated Line Configured',
      tone: 'pending',
      description: 'This restaurant has its own WhatsApp details saved and is waiting for activation.',
    };
  }

  if (normalized === 'session') {
    return {
      label: 'Dedicated Live Session',
      tone: 'dedicated',
      description: 'This restaurant has its own active WhatsApp session or dedicated binding.',
    };
  }

  if (normalized === 'unconfigured') {
    return {
      label: 'Setup Needed',
      tone: 'neutral',
      description: 'No WhatsApp line has been assigned to this restaurant yet.',
    };
  }

  return {
    label: normalized ? normalized.replace(/_/g, ' ') : 'Unknown Binding',
    tone: 'neutral',
    description: 'WhatsApp binding information is available but not categorized yet.',
  };
}

export function getWhatsappBindingPillStyle(tone) {
  const normalized = String(tone || '').trim().toLowerCase();

  if (normalized === 'shared') {
    return {
      color: '#60a5fa',
      backgroundColor: 'rgba(96,165,250,0.12)',
      border: '1px solid rgba(96,165,250,0.22)',
    };
  }

  if (normalized === 'dedicated') {
    return {
      color: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.12)',
      border: '1px solid rgba(34,197,94,0.22)',
    };
  }

  if (normalized === 'pending') {
    return {
      color: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.12)',
      border: '1px solid rgba(245,158,11,0.22)',
    };
  }

  return {
    color: '#94a3b8',
    backgroundColor: 'rgba(148,163,184,0.12)',
    border: '1px solid rgba(148,163,184,0.22)',
  };
}
