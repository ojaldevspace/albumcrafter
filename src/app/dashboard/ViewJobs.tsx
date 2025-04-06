import { motion } from "framer-motion";

export default function ViewJobs() {
  return (
    <motion.div
      className="bg-white p-6 rounded shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">📄 View All My Jobs</h2>
      <p>This is where the list of jobs will be displayed.</p>
    </motion.div>
  );
}
