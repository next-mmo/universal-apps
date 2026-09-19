import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageContainer } from '@package/pro/page-container';
import { ProStepForm, type ProStepItem } from '@package/pro/step-form';
import { Card, CardContent } from '@package/ui/card';
import { toast } from '@package/ui/toast';
import { CheckCircle2Icon } from 'lucide-react';

export default function StepFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [resultValues, setResultValues] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();

  const steps: ProStepItem[] = [
    {
      title: 'Infrastructure Cluster',
      description: 'Select cluster topology and cloud region',
      schema: [
        {
          fields: [
            {
              name: 'clusterName',
              label: 'Cluster Identifier',
              type: 'text',
              required: true,
              placeholder: 'e.g. prod-us-east-cluster-04',
            },
            {
              name: 'region',
              label: 'Cloud Deployment Region',
              type: 'select',
              required: true,
              options: [
                { label: 'US East (N. Virginia - us-east-1)', value: 'us-east-1' },
                { label: 'EU West (Frankfurt - eu-central-1)', value: 'eu-central-1' },
                { label: 'Asia Pacific (Tokyo - ap-northeast-1)', value: 'ap-northeast-1' },
              ],
            },
            {
              name: 'nodes',
              label: 'Initial Node Count',
              type: 'number',
              required: true,
              placeholder: '3',
            },
          ],
        },
      ],
    },
    {
      title: 'Security & Ingress',
      description: 'Configure TLS certificates and network perimeter',
      schema: [
        {
          fields: [
            {
              name: 'domain',
              label: 'Ingress Domain Hostname',
              type: 'text',
              required: true,
              placeholder: 'gateway.cloud.acme.corp',
            },
            {
              name: 'rateLimit',
              label: 'Per-IP Burst Rate Limit',
              type: 'select',
              options: [
                { label: 'Standard (1,000 req/min)', value: '1000' },
                { label: 'High Throughput (5,000 req/min)', value: '5000' },
                { label: 'Enterprise Unlimited (25,000 req/min)', value: '25000' },
              ],
            },
            {
              name: 'tlsMode',
              label: 'TLS Termination Strategy',
              type: 'select',
              options: [
                { label: 'Automated Let\'s Encrypt (Zero config)', value: 'lets-encrypt' },
                { label: 'Custom Enterprise Wildcard Certificate', value: 'custom-cert' },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Validation & Provision',
      description: 'Review operational parameters before rolling out',
      schema: [
        {
          fields: [
            {
              name: 'adminEmail',
              label: 'Primary Notification Contact',
              type: 'text',
              required: true,
              placeholder: 'sre-alerts@acme.corp',
            },
            {
              name: 'notes',
              label: 'Deployment Intent / Ticket Reference',
              type: 'textarea',
              placeholder: 'e.g. INFRA-4821 provisioning for Q3 customer onboardings',
            },
          ],
        },
      ],
    },
  ];

  const handleSubmit = async (values: Record<string, unknown>) => {
    setResultValues(values);
    setSubmitted(true);
    toast.success('Cluster provisioned successfully!');
  };

  return (
    <PageContainer
      title="Multi-Step Cluster Deployment"
      description="Ant Design Pro StepsForm wizard with progressive validation, stage confirmation, and unified state preservation."
      breadcrumbs={['Universal Pro', 'Forms', 'Step Form']}
    >
      <div className="max-w-4xl mx-auto w-full">
        {!submitted ? (
          <Card className="border-border/70 shadow-xs">
            <CardContent className="p-6 md:p-8">
              <ProStepForm
                steps={steps}
                defaultValues={{
                  region: 'us-east-1',
                  nodes: 3,
                  rateLimit: '5000',
                  tlsMode: 'lets-encrypt',
                }}
                onSubmit={handleSubmit}
                onCancel={() => navigate({ to: '/dashboard/workplace' })}
                submitLabel="Deploy Infrastructure Cluster"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 shadow-xs text-center p-8">
            <CardContent className="space-y-4">
              <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2Icon className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Infrastructure Provisioning Initiated</h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your cluster request has been validated and dispatched to the Kubernetes control plane. Telemetry and ingress routes are being configured.
              </p>

              <div className="rounded-lg border border-border/70 bg-muted/20 p-4 max-w-lg mx-auto text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cluster:</span>
                  <span className="font-semibold text-foreground">{(resultValues?.clusterName as string) || 'cluster-prod-01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region:</span>
                  <span className="text-foreground">{resultValues?.region as string}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain:</span>
                  <span className="text-primary font-semibold">{resultValues?.domain as string}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setResultValues(null);
                  }}
                  className="px-4 py-2 text-xs rounded-lg border border-border/80 hover:bg-muted font-medium transition-colors"
                >
                  Deploy Another Cluster
                </button>
                <button
                  onClick={() => navigate({ to: '/dashboard/workplace' })}
                  className="px-4 py-2 text-xs rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                >
                  Return to Workplace
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
