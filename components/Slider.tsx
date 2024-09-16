// components/Slider.tsx
import * as RadixSlider from '@radix-ui/react-slider';

interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  step?: number;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ 
  value = 1, 
  onChange,
  max = 1,
  step = 0.1,
  className
}) => {
  const handleChange = (newValue: number[]) => {
    onChange?.(newValue[0]);
  };

  return (
    <RadixSlider.Root
      className={`relative flex items-center select-none touch-none w-full h-10 ${className}`}
      defaultValue={[value]}
      value={[value]}
      onValueChange={handleChange}
      max={max}
      step={step}
      aria-label="Volume"
    >
      <RadixSlider.Track
        className="bg-neutral-600 relative grow rounded-full h-[3px]"
      >
        <RadixSlider.Range className="absolute bg-white rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-[10px] h-[10px] bg-white rounded-[10px] hover:bg-neutral-300 focus:outline-none"
      />
    </RadixSlider.Root>
  );
}

export default Slider;