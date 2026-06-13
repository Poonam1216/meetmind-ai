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
								content: `You are an expert meeting analyst. Analyze the meeting transcript and return a JSON object with this exact structure:
{
  "summary": "3-5 sentence summary",
  "actionItems": ["action item 1", "action item 2"],
  "email": {
    "subject": "email subject",
    "body": "full email body"
  },
  "sentiment": {
    "overall": "Positive" or "Neutral" or "Negative",
    "score": number between 0 and 100,
    "breakdown": {
      "positive": number,
      "neutral": number,
      "negative": number
    },
    "speakerSentiments": [
      { "name": "Speaker Name", "sentiment": "Positive/Neutral/Negative", "note": "one line observation" }
    ]
  },
  "stats": {
    "speakerCount": number,
    "actionItemCount": number,
    "estimatedDuration": "e.g. ~15 mins",
    "dominantSpeaker": "name",
    "meetingType": "e.g. Planning / Standup / Review"
  },
  "calendarEvent": {
    "title": "Follow-up meeting title",
    "suggestedDate": "e.g. Next Thursday",
    "duration": "30 mins or 60 mins",
    "agenda": ["agenda point 1", "agenda point 2", "agenda point 3"]
  }
}
Return only valid JSON, no markdown, no explanation.`,
							},
							{
								role: "user",
								content: `Analyze this meeting transcript:\n\n${transcript}`,
							},
						],
						temperature: 0.7,
						max_tokens: 2000,
					}),
				}
			);

			if (!response.ok) throw new Error(`API Error: ${response.status}`);
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
		alert("Copied!");
	};

	const downloadICS = () => {
		if (!result?.calendarEvent) return;
		const { title, agenda } = result.calendarEvent;
		const now = new Date();
		const start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
		const end = new Date(start.getTime() + 60 * 60 * 1000);
		const fmt = (d) =>
			d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
		const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MeetMind AI//EN
BEGIN:VEVENT
DTSTART:${fmt(start)}
DTEND:${fmt(end)}
SUMMARY:${title}
DESCRIPTION:Agenda:\\n${agenda.join("\\n")}
END:VEVENT
END:VCALENDAR`;
		const blob = new Blob([icsContent], { type: "text/calendar" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "followup-meeting.ics";
		a.click();
		URL.revokeObjectURL(url);
	};

	const getSentimentColor = (sentiment) => {
		if (sentiment === "Positive") return "#10b981";
		if (sentiment === "Negative") return "#ef4444";
		return "#f59e0b";
	};

	const getSentimentEmoji = (sentiment) => {
		if (sentiment === "Positive") return "😊";
		if (sentiment === "Negative") return "😟";
		return "😐";
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
							placeholder={`Example:\nJohn: Let's discuss the Q3 roadmap...\nSarah: I think we should prioritize the mobile app...\nJohn: Agreed. Sarah can you take that up by Friday?`}
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
							<p>Paste a transcript and click Analyze</p>
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
								<div className="feature-item">
									😊 Sentiment Analysis
								</div>
								<div className="feature-item">
									📊 Meeting Stats
								</div>
								<div className="feature-item">
									📅 Calendar Event
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
						<div className="results-wrapper">
							{/* STATS BAR */}
							<div className="stats-bar">
								<div className="stat-item">
									<span className="stat-value">
										{result.stats?.speakerCount ?? "-"}
									</span>
									<span className="stat-label">Speakers</span>
								</div>
								<div className="stat-item">
									<span className="stat-value">
										{result.stats?.actionItemCount ?? "-"}
									</span>
									<span className="stat-label">
										Action Items
									</span>
								</div>
								<div className="stat-item">
									<span className="stat-value">
										{result.stats?.estimatedDuration ?? "-"}
									</span>
									<span className="stat-label">Duration</span>
								</div>
								<div className="stat-item">
									<span className="stat-value">
										{result.stats?.meetingType ?? "-"}
									</span>
									<span className="stat-label">Type</span>
								</div>
							</div>

							<div className="card results-card">
								<div className="tabs">
									{[
										"summary",
										"actions",
										"email",
										"sentiment",
										"calendar",
									].map((tab) => {
										const labels = {
											summary: "📝 Summary",
											actions: "✅ Actions",
											email: "📧 Email",
											sentiment: "😊 Sentiment",
											calendar: "📅 Calendar",
										};
										return (
											<button
												key={tab}
												className={`tab ${
													activeTab === tab
														? "active"
														: ""
												}`}
												onClick={() =>
													setActiveTab(tab)
												}
											>
												{labels[tab]}
											</button>
										);
									})}
								</div>

								{activeTab === "summary" && (
									<div className="tab-content">
										<div className="content-header">
											<h3>Meeting Summary</h3>
											<button
												className="copy-btn"
												onClick={() =>
													copyToClipboard(
														result.summary
													)
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
												(item, i) => (
													<li
														key={i}
														className="action-item"
													>
														<span className="action-num">
															{i + 1}
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

								{activeTab === "sentiment" && (
									<div className="tab-content">
										<div className="content-header">
											<h3>Sentiment Analysis</h3>
										</div>
										<div
											className="sentiment-overall"
											style={{
												borderColor: getSentimentColor(
													result.sentiment?.overall
												),
											}}
										>
											<span className="sentiment-emoji">
												{getSentimentEmoji(
													result.sentiment?.overall
												)}
											</span>
											<div>
												<div
													className="sentiment-label"
													style={{
														color: getSentimentColor(
															result.sentiment
																?.overall
														),
													}}
												>
													{result.sentiment?.overall}{" "}
													Meeting
												</div>
												<div className="sentiment-score">
													Positivity Score:{" "}
													{result.sentiment?.score}
													/100
												</div>
											</div>
										</div>
										<div className="sentiment-bars">
											<div className="sbar-row">
												<span>Positive</span>
												<div className="sbar-track">
													<div
														className="sbar-fill positive"
														style={{
															width: `${
																result.sentiment
																	?.breakdown
																	?.positive ??
																0
															}%`,
														}}
													></div>
												</div>
												<span>
													{result.sentiment?.breakdown
														?.positive ?? 0}
													%
												</span>
											</div>
											<div className="sbar-row">
												<span>Neutral</span>
												<div className="sbar-track">
													<div
														className="sbar-fill neutral"
														style={{
															width: `${
																result.sentiment
																	?.breakdown
																	?.neutral ??
																0
															}%`,
														}}
													></div>
												</div>
												<span>
													{result.sentiment?.breakdown
														?.neutral ?? 0}
													%
												</span>
											</div>
											<div className="sbar-row">
												<span>Negative</span>
												<div className="sbar-track">
													<div
														className="sbar-fill negative"
														style={{
															width: `${
																result.sentiment
																	?.breakdown
																	?.negative ??
																0
															}%`,
														}}
													></div>
												</div>
												<span>
													{result.sentiment?.breakdown
														?.negative ?? 0}
													%
												</span>
											</div>
										</div>
										<h4 className="speaker-title">
											Per Speaker
										</h4>
										<div className="speaker-sentiments">
											{result.sentiment?.speakerSentiments?.map(
												(s, i) => (
													<div
														key={i}
														className="speaker-card"
													>
														<div className="speaker-name">
															{s.name}
														</div>
														<div
															className="speaker-badge"
															style={{
																background:
																	getSentimentColor(
																		s.sentiment
																	),
															}}
														>
															{s.sentiment}
														</div>
														<div className="speaker-note">
															{s.note}
														</div>
													</div>
												)
											)}
										</div>
									</div>
								)}

								{activeTab === "calendar" && (
									<div className="tab-content">
										<div className="content-header">
											<h3>Calendar Event</h3>
										</div>
										<div className="calendar-card">
											<div className="cal-title">
												{result.calendarEvent?.title}
											</div>
											<div className="cal-meta">
												<span>
													📅{" "}
													{
														result.calendarEvent
															?.suggestedDate
													}
												</span>
												<span>
													⏱{" "}
													{
														result.calendarEvent
															?.duration
													}
												</span>
											</div>
											<h4>Agenda</h4>
											<ul className="agenda-list">
												{result.calendarEvent?.agenda?.map(
													(item, i) => (
														<li
															key={i}
															className="agenda-item"
														>
															<span className="agenda-dot">
																•
															</span>{" "}
															{item}
														</li>
													)
												)}
											</ul>
											<button
												className="download-btn"
												onClick={downloadICS}
											>
												📥 Download .ics (Add to
												Calendar)
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

export default App;
