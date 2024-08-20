export class AgentObject extends EventTarget {
  id: string;
  name: string;
  description: string;
  bio: string;
  model: string;
  address: string;

  constructor({
    name,
    id,
    description,
    bio,
    model,
    address,
  }: {
    id: string;
    name: string;
    description: string;
    bio: string;
    model: string;
    address: string;
  }) {
    super();

    this.id = id;
    this.name = name;
    this.description = description;
    this.bio = bio;
    this.model = model;
    this.address = address;
  }
}