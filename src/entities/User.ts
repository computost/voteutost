import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    name!: string

    @Column("bytea")
    password!: Buffer

    @Column("bytea")
    salt!: Buffer
}