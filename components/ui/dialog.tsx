import type { ReactNode } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { cn } from "../../lib/utils";

// shadcn/ui Dialog, React Native port: a dimmed backdrop with a centered card.
// Tapping the backdrop, "Close", Escape (web) or Back (Android) closes it.
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-4 py-8">
        <Pressable
          aria-label={closeLabel}
          onPress={onClose}
          className="absolute inset-0 bg-black/50"
        />
        <View
          role="dialog"
          aria-modal
          aria-label={title}
          className={cn(
            "w-full max-w-md max-h-full rounded-xl border border-border bg-background shadow-lg",
            className
          )}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="p-6 gap-5">
            <View className="flex-row items-start gap-3">
              <View className="flex-1 gap-1.5">
                <Text role="heading" className="text-xl font-semibold tracking-tight text-foreground">
                  {title}
                </Text>
                {description ? <Text className="text-sm leading-5 text-muted-foreground">{description}</Text> : null}
              </View>
              <Pressable onPress={onClose} className="-mr-2 -mt-1 rounded-md px-2 py-1 web:hover:bg-muted">
                <Text className="text-sm font-medium text-muted-foreground">{closeLabel}</Text>
              </Pressable>
            </View>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
