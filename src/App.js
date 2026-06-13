import React, { useState } from "react";
import "./App.css";

function App() {
	const [transcript, setTranscript] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("summary");

	const analyzeTranscript = async () => {
		if (!transcript.trim()) {
			setError("Please paste a meeting transcript first.");
			return;
		}
		setLoading(true);
		setError("");
		setResult(null);

		try {
			const response = await fetch(
				"https://models.inference.ai.azure.com/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
					},
					body: JSON.stringify({
						model: "gpt-4o",
						messages: [
							{
								role: "system",
								content: `You are an expert meeting analyst. Given a meeting transcript, extract:
1. SUMMARY: A concise 3-5 sentence summary of the meeting.
2. ACTION_ITEMS: A numbered list of clear action items with owner names if mentioned.
3. EMAIL: A professional follow-up email draft with subject line.

Respond in this exact JSON format:
{
  "summary": "...",
  "actionItems": ["item1", "item2", "item3"],
  "email": {
    "subject": "...",
    "body": "..."
  }
}`,
							},
							{
								role: "user",
								content: `Here is the meeting transcript:\n\n${transcript}`,
							},
						],
						temperature: 0.7,
						max_tokens: 1500,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`API Error: ${response.status}`);
			}

			const data = await response.json();
			const content = data.choices[0].message.content;
			const cleaned = content.replace(/```json|```/g, "").trim();
			const parsed = JSON.parse(cleaned);
			setResult(parsed);
		} catch (err) {
			setError(
				"Something went wrong. Check your token and try again. " +
					err.message
			);
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		alert("Copied to clipboard!");
	};

	return (
		<div className="app">
			<header className="header">
				<div className="header-inner">
					<div className="logo">⚡ MeetMind AI</div>
					<div className="tagline">
						Turn meetings into action — instantly
					</div>
				</div>
			</header>

			<main className="main">
				<div className="left-panel">
					<div className="card">
						<h2>📋 Paste Meeting Transcript</h2>
						<p className="hint">
							Paste your Zoom, Teams, or Google Meet transcript
							below
						</p>
						<textarea
							className="transcript-input"
							placeholder="Example:
John: Let's discuss the Q3 roadmap...
Sarah: I think we should prioritize the mobile app...
John: Agreed. Sarah can you take that up by Friday?
..."
							value={transcript}
							onChange={(e) => setTranscript(e.target.value)}
							rows={16}
						/>
						<button
							className={`analyze-btn ${
								loading ? "loading" : ""
							}`}
							onClick={analyzeTranscript}
							disabled={loading}
						>
							{loading ? "🔄 Analyzing..." : "✨ Analyze Meeting"}
						</button>
						{error && <div className="error">{error}</div>}
					</div>
				</div>

				<div className="right-panel">
					{!result && !loading && (
						<div className="empty-state">
							<div className="empty-icon">🎯</div>
							<h3>Your insights will appear here</h3>
							<p>
								Paste a transcript and click Analyze to get
								started
							</p>
							<div className="features">
								<div className="feature-item">
									📝 Meeting Summary
								</div>
								<div className="feature-item">
									✅ Action Items
								</div>
								<div className="feature-item">
									📧 Follow-up Email
								</div>
							</div>
						</div>
					)}

					{loading && (
						<div className="loading-state">
							<div className="spinner"></div>
							<p>AI is analyzing your meeting...</p>
						</div>
					)}

					{result && (
						<div className="card results-card">
							<div className="tabs">
								<button
									className={`tab ${
										activeTab === "summary" ? "active" : ""
									}`}
									onClick={() => setActiveTab("summary")}
								>
									📝 Summary
								</button>
								<button
									className={`tab ${
										activeTab === "actions" ? "active" : ""
									}`}
									onClick={() => setActiveTab("actions")}
								>
									✅ Action Items
								</button>
								<button
									className={`tab ${
										activeTab === "email" ? "active" : ""
									}`}
									onClick={() => setActiveTab("email")}
								>
									📧 Email Draft
								</button>
							</div>

							{activeTab === "summary" && (
								<div className="tab-content">
									<div className="content-header">
										<h3>Meeting Summary</h3>
										<button
											className="copy-btn"
											onClick={() =>
												copyToClipboard(result.summary)
											}
										>
											Copy
										</button>
									</div>
									<p className="summary-text">
										{result.summary}
									</p>
								</div>
							)}

							{activeTab === "actions" && (
								<div className="tab-content">
									<div className="content-header">
										<h3>Action Items</h3>
										<button
											className="copy-btn"
											onClick={() =>
												copyToClipboard(
													result.actionItems.join(
														"\n"
													)
												)
											}
										>
											Copy
										</button>
									</div>
									<ul className="action-list">
										{result.actionItems.map(
											(item, index) => (
												<li
													key={index}
													className="action-item"
												>
													<span className="action-num">
														{index + 1}
													</span>
													{item}
												</li>
											)
										)}
									</ul>
								</div>
							)}

							{activeTab === "email" && (
								<div className="tab-content">
									<div className="content-header">
										<h3>Follow-up Email</h3>
										<button
											className="copy-btn"
											onClick={() =>
												copyToClipboard(
													`Subject: ${result.email.subject}\n\n${result.email.body}`
												)
											}
										>
											Copy
										</button>
									</div>
									<div className="email-subject">
										<strong>Subject:</strong>{" "}
										{result.email.subject}
									</div>
									<pre className="email-body">
										{result.email.body}
									</pre>
								</div>
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

export default App;
