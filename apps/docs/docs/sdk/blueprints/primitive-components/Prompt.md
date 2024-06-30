---
sidebar_position: 1
slug: /sdk/components/prompt
description: "You can render anything you like inside of a prompt tag, and your agent will consider it when thinking!"
sidebar_label: <Prompt />
---

# Thinking with `<Prompt>`s

When it's time for your agent to `.think()`, it will concatenate all of its prompts, in the order they are rendered in React, and use that prompt for inference to generate the next action. Therefore the prompts you use form the bread and butter of your agent's thought process and have a large impact on its behavior.

```tsx
<Agent>
  <Prompt>This agent is female</Prompt>
  <Prompt>They have a sarcastic personality</Prompt>
</Agent>
```

Prompts can be either static (strings) or dynamic (depending on external data or memory). You can render anything you like inside of a prompt tag, and your agent will consider it when thinking!

So a complete, leagal, ```/agents.tsx``` file structure will look like this:

```tsx
import React from 'react';
import { Agent, Prompt, AgentAppProps } from 'react-agents';

export default function render(props: AgentAppProps) {
  return (
    <Agent>
      <Prompt>This agent is female</Prompt>
      <Prompt>They have a sarcastic personality</Prompt>
    </Agent>
  );
}
```