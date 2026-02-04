export const healthCheck = (req, res) => {
  res.json({
    message: "✅ Smart Task Manager API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
};
