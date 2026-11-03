export abstract class Entity<Props> {
  protected props: Props;
  private readonly _id: string;

  protected constructor(props: Props, id: string) {
    this.props = props;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }
}
