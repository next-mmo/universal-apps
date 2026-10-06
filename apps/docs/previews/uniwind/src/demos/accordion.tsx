import { Text, View } from 'react-native';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@package/ui-native';

const items = [
  {
    value: 'item-1',
    question: 'Is it accessible?',
    answer: 'Yes. It uses the shared native components with UniWind styling.',
  },
  {
    value: 'item-2',
    question: 'Is it animated?',
    answer: 'Yes. The native accordion animates expansion with LayoutAnimation.',
  },
  {
    value: 'item-3',
    question: 'Can multiple panels stay open?',
    answer: 'Yes. Pass type="multiple" to the root instead of type="single".',
  },
];

export function AccordionDemo() {
  return (
    <View className='mx-auto w-full max-w-sm'>
      <Accordion type='single'>
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <Text className='font-sans text-sm text-muted-foreground'>{item.answer}</Text>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </View>
  );
}
