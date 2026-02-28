import type { DB } from "../db";
import type { Gender, GenderWithBooks, NewGender } from "../schema/types";
export declare class GenderRepository {
    private db;
    constructor(db: DB);
    /**
     * Create a new gender
     */
    create(data: NewGender): Promise<Gender>;
    /**
     * Get gender by ID
     */
    findById(id: number): Promise<Gender | undefined>;
    /**
     * Get gender by ID with books
     */
    findByIdWithBooks(id: number): Promise<GenderWithBooks | undefined>;
    /**
     * Get gender by name
     */
    findByName(name: string): Promise<Gender | undefined>;
    /**
     * Get all genders
     */
    findAll(): Promise<Gender[]>;
    /**
     * Get all genders with their books
     */
    findAllWithBooks(): Promise<GenderWithBooks[]>;
    /**
     * Search genders by name
     */
    search(query: string): Promise<Gender[]>;
    /**
     * Update a gender
     */
    update(id: number, data: Partial<NewGender>): Promise<Gender | undefined>;
    /**
     * Delete a gender
     */
    delete(id: number): Promise<boolean>;
    /**
     * Count total genders
     */
    count(): Promise<number>;
}
