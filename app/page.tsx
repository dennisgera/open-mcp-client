import { CopilotSidebar } from "@copilotkit/react-ui";
import { CopilotActionHandler } from "./components/CopilotActionHandler";
import { CopilotKitCSSProperties } from "@copilotkit/react-ui";
import { MainContent } from "./components/MainContent";
import { ChatMPCLangGraph } from "@/components/server-dashboard"

export default function Home() {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <CopilotActionHandler />
      
      {/* In this case we simply customize the primary color of the default designs. For more options see https://docs.copilotkit.ai/guides/custom-look-and-feel  */}
      <div
        style={
          {
            "--copilot-kit-primary-color": "#333333",
          } as CopilotKitCSSProperties
        }
      >
        <CopilotSidebar
          defaultOpen={true}
          instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
          labels={{
            title: "MCP Assistant",
            initial: "Need any help?",
          }}
        >
          <ChatMPCLangGraph />
        </CopilotSidebar>
      </div>
    </div>
  );
}
