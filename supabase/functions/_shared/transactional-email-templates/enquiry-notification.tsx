import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { ENQUIRY_RECIPIENT, LEAD_DASHBOARD_URL } from '../enquiry-email-config.ts'

interface Props {
  reference?: string
  type?: string
  name?: string
  phone?: string
  email?: string
  business?: string
  origin?: string
  destination?: string
  urgency?: string
  weight?: string
  date?: string
  priority?: string
  source?: string
  consent?: boolean
  details?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', color: '#1f2633' }
const container = { maxWidth: '560px', padding: '32px 24px' }
const cta = { backgroundColor: '#78B620', color: '#ffffff', padding: '12px 20px', borderRadius: '6px', fontWeight: 600 }

const Email = (p: Props) => (
  <Html lang="en"><Head /><Preview>New {p.type ?? 'delivery'} enquiry — {p.reference ?? 'QikParcel'}</Preview>
    <Body style={main}><Container style={container}>
      <Text>QikParcel</Text>
      <Heading>New {p.type ?? 'delivery'} enquiry</Heading>
      <Text>Reference: {p.reference ?? 'See dashboard'} · Priority: {p.priority ?? 'See dashboard'}</Text>
      <Text>Name: {p.name ?? 'Not supplied'}<br />Phone: {p.phone ?? 'Not supplied'}<br />Email: {p.email || 'Not supplied'}{p.business && <><br />Business: {p.business}</>}</Text>
      <Text>Route: {p.origin || 'Not supplied'} → {p.destination || 'Not supplied'}<br />When: {p.urgency || 'Not supplied'}<br />Date: {p.date || 'Not supplied'}<br />Weight / capacity / volume: {p.weight || 'Not supplied'}</Text>
      <Text>Source: {p.source || 'Website'}<br />Follow-up consent: {p.consent ? 'Yes' : 'No — do not contact without permission'}</Text>
      {p.details && <Text style={{ whiteSpace: 'pre-wrap' }}>{p.details}</Text>}
      <Button href={LEAD_DASHBOARD_URL} style={cta}>Review enquiry</Button>
    </Container></Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data) => `QikParcel: new ${data.type ?? 'delivery'} enquiry ${data.reference ?? ''}`,
  displayName: 'Team enquiry notification',
  to: ENQUIRY_RECIPIENT,
  previewData: { reference: 'QP-EXAMPLE', type: 'sender', name: 'Example sender', origin: 'London', destination: 'Harare', urgency: 'Ready now', priority: 'HOT', consent: true },
} satisfies TemplateEntry