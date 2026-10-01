import { Pressable, Text, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// shadcn/ui Button, React Native port (react-native-reusables pattern)
const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md active:opacity-90 web:transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary web:hover:bg-primary/90",
        outline: "border border-input bg-background web:hover:bg-muted",
        ghost: "web:hover:bg-muted",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
    },
    size: {
      default: "text-sm",
      sm: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    textClassName?: string;
    children: string;
  };

export function Button({ variant, size, className, textClassName, children, ...props }: ButtonProps) {
  return (
    <Pressable
      role="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      <Text className={cn(buttonTextVariants({ variant, size }), textClassName)}>{children}</Text>
    </Pressable>
  );
}
