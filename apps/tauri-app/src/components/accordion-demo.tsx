import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@package/ui/src/components/ui/accordion';

const items = [
  {
    value: 'item-1',
    question: 'Is it accessible?',
    answer: 'Yes. It uses Radix UI primitives with full keyboard and screen-reader support.',
  },
  {
    value: 'item-2',
    question: 'Is it animated?',
    answer:
      'Yes. Height animations come from the accordion-down / accordion-up keyframes defined in the shared theme tokens.',
  },
  {
    value: 'item-3',
    question: 'Can multiple panels stay open?',
    answer: 'Yes. Pass type="multiple" to the root instead of type="single".',
  },
];

/** Live accordion rendered by the Accordion docs page. */
export function AccordionDemo() {
  return (
    <Accordion type='single' collapsible className='mb-6'>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
