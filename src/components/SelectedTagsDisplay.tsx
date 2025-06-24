import { useEntries } from "@/contexts/usePosts";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMap } from "@/utils/IconMap";
import { Frown } from "lucide-react";

function StackItem({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const IconComponent =
    name.toLowerCase() in IconMap
      ? IconMap[name.toLowerCase()]
      : () => <Frown size={12} />;

  return (
    <motion.div
      whileHover="animate"
      whileTap="animate"
      initial="initial"
      className={`flex items-start justify-start rounded-full text-xs p-1 -mr-2 hover:z-10 shadow-lg gap-1 ${
        selected ? "bg-black text-white" : "bg-primary text-foreground"
      }`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      <motion.span className="w-4 h-4 shrink-0 text-center flex items-center justify-center">
        <div className="w-3.5 h-3.5 flex items-center justify-center">
          <IconComponent size={14} />
        </div>
      </motion.span>
      <span className="overflow-hidden whitespace-nowrap">{name}</span>
      <button
        className="ml-1 text-white hover:text-red-400 focus:outline-none"
        onClick={onClick}
        aria-label={`Remove tag ${name}`}
        type="button"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function SelectedTagsDisplay() {
  const { selectedTags, removeTag } = useEntries();

  return (
    <motion.div
      className="flex flex-wrap gap-4 my-2"
      initial={false}
      animate={{
        height: selectedTags.length === 0 ? 0 : "auto",
        opacity: selectedTags.length === 0 ? 0 : 1,
      }}
      exit={{
        height: 0,
        opacity: 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ overflow: "hidden" }}
    >
      <AnimatePresence initial={false}>
        {selectedTags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            layout
            className="flex items-center"
          >
            <StackItem name={tag} selected onClick={() => removeTag(tag)} />
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
