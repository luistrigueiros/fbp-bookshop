import { eq, like } from "drizzle-orm";
import type { DB } from "../db";
import { gender } from "../schema";
import type { Gender, GenderWithBooks, NewGender } from "../schema/types";
import { layerLogger } from "../logging";

export class GenderRepository {
  constructor(private db: DB) { }

  /**
   * Create a new gender
   */
  async create(data: NewGender): Promise<Gender> {
    layerLogger.debug("Creating new gender: {name}", { name: data.name });
    const result = await this.db.insert(gender).values(data).returning();
    const createdGender = result[0]!;
    layerLogger.info("Created gender: {name} (ID: {id})", { name: createdGender.name, id: createdGender.id });
    return createdGender;
  }

  /**
   * Get gender by ID
   */
  async findById(id: number): Promise<Gender | undefined> {
    const result = await this.db.select().from(gender).where(eq(gender.id, id));
    return result[0];
  }

  /**
   * Get gender by ID with books
   */
  async findByIdWithBooks(id: number): Promise<GenderWithBooks | undefined> {
    return this.db.query.gender.findFirst({
      where: eq(gender.id, id),
      with: {
        books: true,
      },
    });
  }

  /**
   * Get gender by name
   */
  async findByName(name: string): Promise<Gender | undefined> {
    const result = await this.db
      .select()
      .from(gender)
      .where(eq(gender.name, name));
    return result[0];
  }

  /**
   * Get all genders
   */
  async findAll(): Promise<Gender[]> {
    return this.db.select().from(gender);
  }

  /**
   * Get all genders with their books
   */
  async findAllWithBooks(): Promise<GenderWithBooks[]> {
    return this.db.query.gender.findMany({
      with: {
        books: true,
      },
    });
  }

  /**
   * Search genders by name
   */
  async search(query: string): Promise<Gender[]> {
    const searchPattern = `%${query}%`;
    return this.db
      .select()
      .from(gender)
      .where(like(gender.name, searchPattern));
  }

  /**
   * Update a gender
   */
  async update(
    id: number,
    data: Partial<NewGender>,
  ): Promise<Gender | undefined> {
    layerLogger.debug("Updating gender ID: {id}", { id });
    const result = await this.db
      .update(gender)
      .set(data)
      .where(eq(gender.id, id))
      .returning();
    const updatedGender = result[0];
    if (updatedGender) {
      layerLogger.info("Updated gender ID: {id}", { id });
    }
    return updatedGender;
  }

  /**
   * Delete a gender
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(gender)
      .where(eq(gender.id, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Count total genders
   */
  async count(): Promise<number> {
    const result = await this.db.select().from(gender);
    return result.length;
  }
}
